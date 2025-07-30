import { ApartmentProfile } from '@modules/apartments/apartmentProfile.model';
import { Apartment } from '@modules/apartments/apartment.model';
import { Unit } from '@modules/units/unit.model';
import { sendInviteEmail } from '@/utils/sendInviteEmail';
import { v4 as uuidv4 } from 'uuid';
import { clerkClient } from '@clerk/express';
import { AppException } from '@common/error-handler/errorHandler';
import { truncate } from 'fs';

export class ApartmentInviteService {
  static async inviteUser({
    email,
    role,
    apartmentId,
    unitId,
    invitedBy,
    clientOrigin
  }: {
    email: string;
    role: 'owner' | 'caretaker' | 'tenant';
    apartmentId: string;
    unitId?: string;
    invitedBy: string;
    clientOrigin: string;
  }) {
    let clerkUser: any = null; // Declare clerkUser in the outer scope
    
    try {
      if (!email || !email.includes('@')) {
        throw new AppException('Valid email is required', 400);
      }
      
      if (!['owner', 'caretaker', 'tenant'].includes(role)) {
        throw new AppException('Invalid role specified', 400);
      }
      
      const apartment = await Apartment.findById(apartmentId);
      if (!apartment) {
        throw new AppException('Apartment not found', 404);
      }
      
      let unit = null;
      if (unitId) {
        unit = await Unit.findOne({ _id: unitId, apartmentId });
        if (!unit) {
          throw new AppException('Unit not found in the specified apartment', 404);
        }
      }
      
      // Check if user exists in Clerk
      try {
        const usersResponse = await clerkClient.users.getUserList({ emailAddress: [email] });
        const users = usersResponse?.data || [];
        clerkUser = users.length > 0 ? users[0] : null;
      } catch (error: any) {
        throw new AppException(
          error,
          error.message || 'Error checking user in Clerk',
          500,
        );
      }
      
      let generatedPassword = '';
      let isNewUser = false;
      
      if (!clerkUser) {
        const uuid = uuidv4().replace(/-/g, '');
        generatedPassword = `${uuid.substring(0, 12)}Aa1!`;
        
        try {
          const emailUsername = email.split('@')[0];
          const firstName = emailUsername.split('.')[0] || 'User';
          const lastName = emailUsername.split('.')[1] || 'Invited';
          
          clerkUser = await clerkClient.users.createUser({
            emailAddress: [email],
            password: generatedPassword,
            firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
            lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
            publicMetadata: {
              needsPasswordReset: true
            },
            privateMetadata: {
              passwordHasBeenReset: true
            }
          });
          isNewUser = true;
        } catch (clerkError: any) {
          throw new AppException(
            clerkError,
            clerkError.message,
            422,
          );
        }
      }
      
      const existingProfile = await ApartmentProfile.findOne({
        userId: clerkUser.id,
        apartmentId
      });
      
      if (existingProfile) {
        throw new AppException('User already has a profile for this apartment', 400);
      }
      
      // Create ApartmentProfile
      const profile = await ApartmentProfile.create({
        userId: clerkUser.id,
        apartmentId,
        role,
        unitId: unitId,
        invitedBy,
        status: 'invited',
      });
      
      // Send invite email
      await sendInviteEmail({
        to: email,
        apartmentName: apartment.name,
        unitNo: unit?.unitNo,
        role,
        inviteLink: `${clientOrigin}`,
        isNewUser,
        generatedPassword,
      });
      
      return { profile, isNewUser };
      
    } catch(error: any) {
      if (clerkUser?.id) {
        try {
          await clerkClient.users.deleteUser(clerkUser.id);
          await ApartmentProfile.deleteOne({ userId: clerkUser.id, apartmentId });
        } catch (cleanupError: any) {
          throw new AppException(
            cleanupError,
            cleanupError.message,
            cleanupError.status || 500,
          );
        }
      }
      
      throw new AppException(
        error,
        error.message || 'An error occurred during user invitation',
        error.status || 500,
      );
    }
  }
}