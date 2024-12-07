import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedTimezones = async () => {
	const result = await prisma.timezoneMap.findMany();

	// Update value to reflect number of timezones in the database
	if (result.length > 0) {
		console.log('Timezones already seeded');
		return;
	} else {
		// Wipe table
		await prisma.timezoneMap.deleteMany();

		const timezones = [
			{ timezone: 'Eastern Standard Time (EST)' },
			{ timezone: 'Central Standard Time (CST)' },
			{ timezone: 'Mountain Standard Time (MST)' },
			{ timezone: 'Pacific Standard Time (PST)' },
			{ timezone: 'Indian Standard Time (IST)' },
			{ timezone: 'Central European Time (CET)' },
			{ timezone: 'Eastern European Time (EET)' },
			{ timezone: 'Japan Standard Time (JST)' },
			// Add more timezones as needed
		];

		for (const tz of timezones) {
			await prisma.timezoneMap.create({
				data: tz,
			});
		}
	}

	await prisma.$disconnect();
};

export default seedTimezones;
