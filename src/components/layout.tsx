import type LayoutProps from '~/interfaces/layoutProps';
import NavBar from './navbar';

const Layout: React.FC<LayoutProps> = ({ sessionData, children }) => {
	return (
		<>
			<main className="h-svh flex flex-col bg-white">{children}</main>
			<NavBar sessionData={sessionData ? sessionData : null}></NavBar>
		</>
	);
};

export default Layout;
