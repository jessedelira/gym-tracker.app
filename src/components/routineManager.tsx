import { type Routine, type Session } from '@prisma/client';
import { type Session as AuthSession } from 'next-auth'; // duplicate identifiers for interface
import React, { type FormEvent, useState, useEffect } from 'react';
import { api } from '~/utils/api';
import { getSessionIdInputElement } from '~/utils/documentUtils';
import TrashCanIcon from './icons/trashCanIcon';

interface RoutineManagerProps {
	activeRoutine: Routine | null | undefined;
	sessionData: AuthSession | null;
}

const RoutineManager: React.FC<RoutineManagerProps> = ({
	activeRoutine,
	sessionData,
}) => {
	const [sessionsOnAR, setSessionsOnAR] = useState<Session[]>([]);

	const { data: sessionsNotOnActiveRoutine } =
		api.session.getSessionsThatAreNotAddedToActiveRoutine.useQuery({
			userId: sessionData?.user.id ?? '',
		});
	const { data: sessionsOnActiveRoutine } =
		api.session.getSessionsAddedToCurrentActiveRoutine.useQuery({
			userId: sessionData?.user.id ?? '',
		});
	const addSessionToActiveRoutineMutation =
		api.routine.addSessionToActiveRoutine.useMutation();

	const handleAddButtonClicked = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (sessionData) {
			const sessionId = getSessionIdInputElement(document).value;

			const routineData =
				await addSessionToActiveRoutineMutation.mutateAsync({
					userId: sessionData.user.id,
					sessionId: sessionId,
				});

			if (routineData) {
				setSessionsOnAR([...routineData.sessions]);
			}
		}
	};

	useEffect(() => {
		if (sessionsOnActiveRoutine) {
			setSessionsOnAR(sessionsOnActiveRoutine);
		}
	}, [sessionsOnActiveRoutine]);

	return (
		<>
			<div className="mt-6">
				<div className="flex justify-center">
					<h1 className="text-2xl">Routine Manager</h1>
				</div>
				<form
					onSubmit={(e) => void handleAddButtonClicked(e)}
					className="flex justify-center"
				>
					<div className="mat-4 w-18 mr-2 grid grid-cols-1 pl-2">
						<select
							id="sessionId"
							required
							className="rounded-md bg-gray-300 px-4 py-2 text-white"
						>
							{sessionsNotOnActiveRoutine
								? sessionsNotOnActiveRoutine.map((session) => (
										<option
											key={session.id}
											value={session.id}
										>
											{session.name}
										</option>
								  ))
								: null}
						</select>
					</div>
					<button
						className="h-9 w-32 rounded-md bg-lime-300"
						onClick={() => handleAddButtonClicked}
					>
						Add
					</button>
				</form>

				<p className="flex justify-center">
					Active Sessions in {activeRoutine?.name}
				</p>
				{sessionsOnAR?.map(
					(session) =>
						(
							<div
								key={session.id}
								className="flex justify-center"
							>
								<p>Session: {session.name}</p>
								<button className='bg-red-300 ml-4 rounded-full w-6 h-6'>
									<TrashCanIcon></TrashCanIcon>
								</button>
							</div>
						) ?? null,
				)}

				{/* The blocks to represent the days of the week */}
				<div className="mt-2 flex justify-center gap-1">
					<div className="flex h-10 w-10 justify-center border-2 border-black bg-lime-500/90 text-2xl">
						S
					</div>
					<div className="flex h-10 w-10 justify-center border-2 border-black bg-white text-2xl">
						M
					</div>
					<div className="flex h-10 w-10 justify-center border-2 border-black bg-white text-2xl">
						T
					</div>
					<div className="flex h-10 w-10 justify-center border-2 border-black bg-lime-500/90 text-2xl">
						W
					</div>
					<div className="flex h-10 w-10 justify-center border-2 border-black bg-white text-2xl">
						T
					</div>
					<div className="flex h-10 w-10 justify-center border-2 border-black bg-lime-500/90 text-2xl">
						F
					</div>
					<div className="flex h-10 w-10 justify-center border-2 border-black bg-white text-2xl">
						S
					</div>
				</div>
			</div>
		</>
	);
};

export default RoutineManager;
