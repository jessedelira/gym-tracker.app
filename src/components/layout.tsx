import NavBar from './navbar';

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white">
			<main className="flex-1 overflow-y-auto mb-24 pt-16">
				{children}
			</main>
			<NavBar />
		</div>
	);
};

export default Layout;
