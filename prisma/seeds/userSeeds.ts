import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const seedUsers = async () => {
	const result = await prisma.user.findUnique({
		where: {
			username: 'superuser',
		},
	});

	if (result) {
		console.log('Users already seeded');
		return;
	} else {
		await prisma.user.create({
			data: {
				username: 'superuser',
				password:
					'$2b$10$00KSEDAm4EqdfS94ukk9e.uuiPxUdR8Si.sbSGHCFzZ4qkNcw2M3e',
				firstName: 'super',
				lastName: 'user',
			},
		});

		const user = await prisma.user.findUnique({
			where: {
				username: 'superuser',
			},
		});

		if (!user) {
			console.log('Failed to create user');
			return;
		}

		await prisma.userPreference.create({
			data: {
				userId: user.id,
				preference: 'CONFETTI_ON_SESSION_COMPLETION',
				enabled: true,
			},
		});

		const estTimezone = await prisma.timezoneMap.findUnique({
			where: {
				timezone: 'Eastern Standard Time (EST)',
			},
		});

		if (!estTimezone) {
			throw new Error('Failed to find timezone');
		}

		await prisma.userSetting.create({
			data: {
				userId: user.id,
				timezoneId: estTimezone.id,
			},
		});
	}
	await prisma.$disconnect();
};

export default seedUsers;
