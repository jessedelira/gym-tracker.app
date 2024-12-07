import seedUsers from './seeds/userSeeds';
import seedExercises from './seeds/exerciseSeeds';
import seedTimezones from './seeds/timezoneSeeds';

/**
 * Cannot use global prisma instance in seed files because of the server not running yet,
 * the prisma global references an instance of PrismaClient that is connected to the database. But
 * that doesn't happen when the npm i/seed commands are executed
 */
const main = async () => {
	await seedTimezones();
	await seedUsers();
	await seedExercises();
};

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
