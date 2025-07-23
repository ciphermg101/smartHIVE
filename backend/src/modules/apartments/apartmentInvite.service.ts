import { ApartmentProfile } from '@modules/apartments/apartmentProfile.model';
import { Apartment } from '@modules/apartments/apartment.model';
import { Unit } from '@modules/units/unit.model';
import { sendInviteEmail } from '@/utils/sendInviteEmail';
import { v4 as uuidv4 } from 'uuid';
import { clerkClient } from '@clerk/express';
import { AppException } from '@common/error-handler/errorHandler';

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
    try {
      // Input validation
      if (!email || !email.includes('@')) {
        throw new AppException('Valid email is required', 400);
      }

      if (!['owner', 'caretaker', 'tenant'].includes(role)) {
        throw new AppException('Invalid role specified', 400);
      }

      // Check if apartment exists
      const apartment = await Apartment.findById(apartmentId);
      if (!apartment) {
        throw new AppException('Apartment not found', 404);
      }

      // Check if unit exists and belongs to the apartment if provided
      let unit = null;
      if (unitId) {
        unit = await Unit.findOne({ _id: unitId, apartmentId });
        if (!unit) {
          throw new AppException('Unit not found in the specified apartment', 404);
        }
      }

      // Check if user exists in Clerk
      let clerkUser = null;
      try {
        const usersResponse = await clerkClient.users.getUserList({ emailAddress: [email] });
        const users = Array.isArray(usersResponse) ? usersResponse : usersResponse.data;
        clerkUser = users.length > 0 ? users[0] : null;
      } catch (error: any) {
        throw new AppException(error, error.message, error.status);
      }

      let generatedPassword = '';
      let isNewUser = false;
      
      try {
        if (!clerkUser) {
          // Create Clerk user with generated password
          generatedPassword = `${uuidv4()}A1!`;
          clerkUser = await clerkClient.users.createUser({
            emailAddress: [email],
            password: generatedPassword,
            publicMetadata: {},
          });
          isNewUser = true;
        }

        // Check if user already has a profile for this apartment
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
          unitId: unitId || undefined,
          invitedBy,
          status: 'pending',
        });
        
        // Send invite email
        await sendInviteEmail({
          to: email,
          apartmentName: apartment?.name || '',
          unitNo: unit?.unitNo,
          role,
          inviteLink: `${clientOrigin}/accept-invite?token=${profile._id}`,
          isNewUser,
          generatedPassword,
        });
        
        return { profile, isNewUser };
        
      } catch (error: any) {
        if (error instanceof AppException) {
          throw error;
        }
        throw new AppException(error, error.message, error.status);
      }
      
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }
}