import { useEffect, useState } from 'react';
import { api } from '~/utils/api';
import HomePageSessionCard from './homePageSessionCard';
import SmallSpinner from './smallSpinner';

interface CurrentWorkoutDisplayProps {
	userId: string;
	currentDate: Date;
}

const CurrentWorkoutDisplay: React.FC<CurrentWorkoutDisplayProps> = ({
	userId,
	currentDate,
}) => {
	const [allWorkoutsCompleted, setAllWorkoutsCompleted] = useState(false);
	const [sessionHasStarted, setSessionHasStarted] = useState(false);

	//#region Queries
	const {
		data: possibleSessionsToStart,
		isLoading: isPossibleSessionsToStartLoading,
	} = api.session.getSessionsThatAreActiveOnDate.useQuery({
		userId: userId,
		date: currentDate,
	});

	const {
		data: activeSessionData,
		isLoading: activeSessionDataIsLoading,
		refetch: refetchActiveSessionData,
	} = api.activeSesssion.getActiveSession.useQuery({
		userId: userId,
	});
	const {
		data: listOfCompletedSessionIdsForActiveRoutine,
		isLoading: isListOfCompletedSessionIdsForActiveRoutineLoading,
		refetch: refetchListOfCompletedSessionIdsForActiveRoutine,
	} = api.completedSession.getListOfÇompletedSessionIdsForActiveRoutine.useQuery(
		{
			userId: userId,
			currentDate: currentDate,
		},
	);
	const {
		data: workoutsForActiveSession,
		isLoading: workoutsForActiveSessionIsLoading,
		refetch: refetchWorkoutsForActiveSession,
	} = api.workout.getWorkoutsForActiveSession.useQuery({
		userId: userId,
		clientCurrentDate: currentDate,
		sessionId: activeSessionData?.session.id ?? '',
	});
	//#endregion

	//#region Mutations
	const {
		mutateAsync: addActiveSessionMutationAsync,
		isLoading: isLoadingActiveSessionMutationAsync,
	} = api.activeSesssion.addActiveSession.useMutation();
	const setWorkoutAsCompletedMutation =
		api.workout.setWorkoutAsCompleted.useMutation();
	const setWorkoutAsNotCompletedMutation =
		api.workout.setWorkoutAsNotCompleted.useMutation();
	const createCompletedSessionMutation =
		api.completedSession.createCompletedSession.useMutation();
	//#endregion

	const handleCheckboxChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const workoutId = event.target.id;
		const isNowChecked = event.target.checked;
		if (isNowChecked) {
			await setWorkoutAsCompletedMutation.mutateAsync({ workoutId });
		} else {
			await setWorkoutAsNotCompletedMutation.mutateAsync({ workoutId });
			event.target.removeAttribute('checked');
		}

		if (!workoutsForActiveSession) return;

		const allWorkoutsCompleted = workoutsForActiveSession?.every(
			(workout) => {
				if (workout.isCompletedOnActiveSession) {
					return workout.isCompletedOnActiveSession;
				} else if (workout.id === workoutId && isNowChecked) {
					return true;
				} else {
					return false;
				}
			},
		);

		setAllWorkoutsCompleted(allWorkoutsCompleted);
		void refetchWorkoutsForActiveSession();
	};

	const handleCheckboxChangeWrapper = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		void handleCheckboxChange(event);
	};

	const handleStartSessionClick = async (sessionId: string) => {
		await addActiveSessionMutationAsync(
			{
				userId: userId,
				sessionId: sessionId,
			},
			{
				onSuccess: () => {
					setSessionHasStarted(true);
					setAllWorkoutsCompleted(false);
				},
			},
		);
		await refetchActiveSessionData();
	};

	const handleCompleteSessionClick = async () => {
		if (!activeSessionData) return;

		await createCompletedSessionMutation.mutateAsync({
			userId: userId,
			sessionId: activeSessionData.session.id,
		});
		await Promise.all([
			refetchActiveSessionData(),
			refetchWorkoutsForActiveSession(),
			refetchListOfCompletedSessionIdsForActiveRoutine(),
		]);
		setSessionHasStarted(false);
		setAllWorkoutsCompleted(false);
	};

	const handleCompleteSessionClickWrapper = () => {
		void handleCompleteSessionClick();
	};

	useEffect(() => {
		if (workoutsForActiveSession) {
			workoutsForActiveSession.forEach((workout) => {
				if (workout.isCompletedOnActiveSession) {
					const checkbox = document.getElementById(workout.id);
					if (checkbox) {
						checkbox.setAttribute('checked', 'true');
					}
				}
			});

			// check to see if all workoutsForActiveSession are completed to setstate
			const allWorkoutsCompleted = workoutsForActiveSession.every(
				(workout) => workout.isCompletedOnActiveSession,
			);
			setAllWorkoutsCompleted(allWorkoutsCompleted);
		}
	}, [workoutsForActiveSession]);

	if (
		activeSessionDataIsLoading ||
		workoutsForActiveSessionIsLoading ||
		isPossibleSessionsToStartLoading ||
		isListOfCompletedSessionIdsForActiveRoutineLoading ||
		isLoadingActiveSessionMutationAsync
	) {
		return <SmallSpinner />;
	}

	const workoutCard = (
		workout: {
			exercise: {
				id: string;
				name: string;
				description: string | null;
			};
		} & {
			id: string;
			reps: number;
			sets: number;
			weightLbs: number;
			isCompletedOnActiveSession: boolean;
			exerciseId: string;
			sessionId: string;
			userId: string;
		},
	) => (
		<div
			key={workout.id}
			className="mt-4 w-80 overflow-hidden rounded-lg bg-[#f5f5f5] shadow-lg"
		>
			<div className="p-6 md:p-8">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-lg font-semibold">
						{workout.exercise.name}
					</h3>
					<div className="flex items-center">
						<input
							type="checkbox"
							id={workout.id}
							className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
							onChange={handleCheckboxChangeWrapper}
						/>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-3 text-sm text-[#666666]">
					<div>Reps: {workout.reps}</div>
					<div className="text-right">Sets: {workout.sets}</div>
					<div>Weight: {workout.weightLbs} lbs</div>
				</div>
			</div>
		</div>
	);

	return (
		<div>
			{possibleSessionsToStart && possibleSessionsToStart.length === 0 ? (
				<h1 className="flex justify-center font-medium">
					No sessions for today 🎉
				</h1>
			) : (
				<div>
					{activeSessionData === null &&
					sessionHasStarted === false ? (
						<div className="flex flex-col justify-center">
							{possibleSessionsToStart &&
								possibleSessionsToStart.map((session) => (
									<HomePageSessionCard
										key={session.id}
										sessionName={session.name}
										sessionDescription={
											session.description ?? ''
										}
										handleStartButtonClick={() =>
											handleStartSessionClick(session.id)
										}
										isCompleted={listOfCompletedSessionIdsForActiveRoutine?.includes(
											session.id,
										)}
									></HomePageSessionCard>
								))}
						</div>
					) : (
						<div>
							<div className="mt-8">
								<h1 className="font-bold">
									Current Workout Session:{' '}
									{activeSessionData?.session.name ?? ''}
								</h1>
								<div className="grid grid-cols-1">
									{workoutsForActiveSession &&
										workoutsForActiveSession.map(
											(workout) => workoutCard(workout),
										)}

									<div className="flex justify-center">
										{allWorkoutsCompleted && (
											<button
												className="mt-8 rounded-md bg-lime-300 p-3 font-medium"
												onClick={
													handleCompleteSessionClickWrapper
												}
											>
												Complete Session
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default CurrentWorkoutDisplay;
