import { ApartmentProfile } from '@modules/apartments/apartmentProfile.model';
import { Apartment } from '@modules/apartments/apartment.model';
import { Unit } from '@modules/units/unit.model';
import { sendInviteEmail } from '@/utils/sendInviteEmail';
import { v4 as uuidv4 } from 'uuid';
import { clerkClient } from '@clerk/express';

export class ApartmentInviteService {
  static async inviteUser({ email, role, apartmentId, unitId, invitedBy, clientOrigin }: {
    email: string;
    role: 'owner' | 'caretaker' | 'tenant';
    apartmentId: string;
    unitId?: string;
    invitedBy: string;
    clientOrigin: string;
  }) {

    // Check if user exists in Clerk
    let clerkUser = null;
    try {
      const usersResponse = await clerkClient.users.getUserList({ emailAddress: [email] });
      const users = Array.isArray(usersResponse) ? usersResponse : usersResponse.data;
      clerkUser = users.length > 0 ? users[0] : null;
    } catch (err) {
      clerkUser = null;
    }

    let generatedPassword = '';
    let isNewUser = false;
    if (!clerkUser) {
      // Create Clerk user with generated password
      generatedPassword = uuidv4() + 'A1!';
      clerkUser = await clerkClient.users.createUser({
        emailAddress: [email],
        password: generatedPassword,
        publicMetadata: {},
      });
      isNewUser = true;
    }

    // Create ApartmentProfile
    const profile = await ApartmentProfile.create({
      userId: clerkUser.id,
      apartmentId,
      role,
      unitId: unitId || undefined,
      invitedBy,
      status: 'active',
    });
    
    // Send invite email
    const apartment = await Apartment.findById(apartmentId);
    let unit = null;
    if (unitId) unit = await Unit.findById(unitId);
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
  }
} 