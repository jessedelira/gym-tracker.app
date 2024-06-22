interface HomePageSessionCardProps {
	sessionName: string;
	sessionDescription: string;
	handleStartButtonClick?: () => void;
}

const HomePageSessionCard: React.FC<HomePageSessionCardProps> = ({
	sessionName,
	sessionDescription,
	handleStartButtonClick,
}) => {
	return (
		<section className="bg-muted w-full py-12 md:py-24 lg:py-32">
			<div className="container grid grid-cols-1 gap-6 px-4 md:grid-cols-3 md:px-6">
				<div className="overflow-hidden rounded-lg border">
					<div className="p-4">
						<h3 className="text-xl font-bold">{sessionName}</h3>
						<p className="text-muted-foreground">
							{sessionDescription}
						</p>
						<div className="mt-4">
							<button
								onClick={handleStartButtonClick}
								className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
							>
								Start
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HomePageSessionCard;
