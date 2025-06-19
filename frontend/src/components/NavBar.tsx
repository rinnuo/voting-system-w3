import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { URLS } from '../navigation/CONSTANTS';

const NavBar = () => {
	const navigate = useNavigate()

	const token = localStorage.getItem('access_token')
	const user = token ? JSON.parse(localStorage.getItem('user') || '{}') : null

	const handleLogout = () => {
		AuthService.logout();
	};

	return (
		<nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-lg font-bold">
          Voting System
        </Link>

        <div className="space-x-4">
          {!token ? (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white">
                Login
              </Link>
            </>
          ) : (
            <>
              {user?.role === 'SUPER' && (
                <>
                  <Link to={URLS.USERS.LIST} className="text-gray-300 hover:text-white">
                    Lista de Usuarios
                  </Link>
                  <Link to={URLS.USERS.CREATE} className="text-gray-300 hover:text-white">
                    Crear Usuario
                  </Link>
                </>
              )}
              {user?.role === 'PADRON' && (
                <>
                  <Link to="#" className="text-gray-300 hover:text-white">
                    PADRON PLACEHOLDER
                  </Link>
                </>
              )}
              {user?.role === 'ELECCION' && (
                <>
                  <Link to="#" className="text-gray-300 hover:text-white">
                    ELECCION PLACEHOLDER
                  </Link>
                </>
              )}
							{user?.role === 'JURADO' && (
								<>
									<Link to="#" className="text-gray-300 hover:text-white">
										JURADO PLACEHOLDER
									</Link>
								</>
              )}
              <button onClick={handleLogout} className="text-gray-300 hover:text-white">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
	);
};

export default NavBar;