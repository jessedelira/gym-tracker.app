import { prisma } from '~/server/db';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const completedSessionRouter = createTRPCRouter({
	createCompletedSession: protectedProcedure
		.input(
			z.object({
				userId: z.string(),
				sessionId: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			// 1. find session by id
			const activeSession = await prisma.activeSession.findFirst({
				where: {
					sessionId: input.sessionId,
				},
			});

			if (!activeSession) {
				throw new Error('Session not found');
			}

			// TODO: calculate percentage of workouts completed
			// calculate percentage of workouts completed
			// const compiledWorkouts = await prisma.workout.findMany({
			//     where: {
			//         sessionId: input.sessionId,
			//     },
			// });

			// const workoutsCompleted = compiledWorkouts.filter((workout) => {
			//     return workout.isCompletedOnActiveSession;
			// });

			// const percentageCompleted = workoutsCompleted.length / compiledWorkouts.length;

			const createdCompletedSession =
				await prisma.completedSession.create({
					data: {
						startedAt: activeSession.startedAt,
						percentageCompleted: 1,
						sessionId: input.sessionId,
						userId: input.userId,
					},
				});

			// delete from active session
			await prisma.activeSession.delete({
				where: {
					id: activeSession.id,
				},
			});

			return createdCompletedSession;
		}),

	getListOfCompletedSessionIdsForActiveRoutine: protectedProcedure
		.input(z.object({ userId: z.string(), currentDate: z.date() }))
		.query(async ({ input }) => {
			// find all session for active routine
			// find all completed sessions

			console.log('--------------------------------');
			console.log('input.currentDate', input.currentDate);
			console.log(
				'input.currentDate.toISOString()',
				input.currentDate.toISOString(),
			);
			console.log(
				'input.currentDate in EST',
				input.currentDate.toLocaleString('en-US', {
					timeZone: 'America/New_York',
				}),
			);
			console.log('--------------------------------');

			const startOfDayCurrentDate = new Date(input.currentDate);
			startOfDayCurrentDate.setHours(0, 0, 0, 0);

			console.log('startOfDayCurrentDate', startOfDayCurrentDate);
			console.log(
				'startOfDayCurrentDate.toISOString()',
				startOfDayCurrentDate.toISOString(),
			);
			console.log(
				'startOfDayCurrentDate in EST',
				startOfDayCurrentDate.toLocaleString('en-US', {
					timeZone: 'America/New_York',
				}),
			);
			console.log('--------------------------------');

			const endOfDayCurrentDate = new Date(input.currentDate);
			endOfDayCurrentDate.setHours(23, 59, 59, 999);

			console.log('endOfDayCurrentDate', endOfDayCurrentDate);
			console.log(
				'endOfDayCurrentDate.toISOString()',
				endOfDayCurrentDate.toISOString(),
			);
			console.log(
				'endOfDayCurrentDate in EST',
				endOfDayCurrentDate.toLocaleString('en-US', {
					timeZone: 'America/New_York',
				}),
			);
			console.log('--------------------------------');

			const sessionsOnActiveRoutine = await prisma.session.findMany({
				where: {
					userId: input.userId,
					routine: {
						isActive: true,
					},
				},
			});

			const completedSessionIds = await prisma.completedSession.findMany({
				select: {
					sessionId: true,
				},
				where: {
					userId: input.userId,
					sessionId: {
						in: sessionsOnActiveRoutine.map(
							(session) => session.id,
						),
					},
					completedAt: {
						gte: startOfDayCurrentDate,
						lte: endOfDayCurrentDate,
					},
				},
			});

			if (completedSessionIds.length === 0) {
				return null;
			}
			// make the array just the ids and no object
			const completedSessionIdsArray = completedSessionIds.map(
				(session) => session.sessionId,
			);

			if (completedSessionIdsArray.length === 0) {
				return null;
			}

			return completedSessionIdsArray;
		}),
});
