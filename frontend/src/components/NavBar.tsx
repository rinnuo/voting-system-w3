import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { URLS } from '../navigation/CONSTANTS';
import Button from './Button';
import Dropdown from './Dropdown';

const NavBar = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  const user = token ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  const handleLogout = () => {
    AuthService.logout();
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-lg font-bold">
          Voting System
        </Link>

        <div className="space-x-4 flex items-center">
          {!token ? (
            <Button as={Link} to={URLS.LOGIN} variant="primary">
              Login
            </Button>
          ) : (
            <>
              {user?.role === 'SUPER' && (
                <Dropdown label="Usuarios">
                  <Link to={URLS.USERS.LIST} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                    Lista de Usuarios
                  </Link>
                  <Link to={URLS.USERS.CREATE} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                    Crear Usuario
                  </Link>
                </Dropdown>
              )}
              {user?.role === 'ELECCION' && (
                <>
                  <Dropdown label="Secciones">
                    <Link to={URLS.SECCIONES.LIST} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Lista de Secciones
                    </Link>
                    <Link to={URLS.SECCIONES.CREATE} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Crear Seccion
                    </Link>
                  </Dropdown>
                  <Dropdown label="Recintos">
                    <Link to={URLS.RECINTOS.LIST} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Lista de Recintos
                    </Link>
                    <Link to={URLS.RECINTOS.CREATE} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Crear Recinto
                    </Link>
                  </Dropdown>
                  <Dropdown label="Mesa">
                    <Link to={URLS.MESAS.LIST} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Lista de Mesas
                    </Link>
                    <Link to={URLS.MESAS.CREATE} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Crear Mesa
                    </Link>
                  </Dropdown>
                  <Dropdown label="Elecciones">
                    <Link to={URLS.ELECCIONES.LIST} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Lista de Elecciones
                    </Link>
                    <Link to={URLS.ELECCIONES.CREATE} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Crear Eleccion
                    </Link>
                  </Dropdown>
                  <Dropdown label="Cargos">
                    <Link to={URLS.CARGOS.LIST} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Lista de Cargos
                    </Link>
                    <Link to={URLS.CARGOS.CREATE} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Crear Cargo
                    </Link>
                  </Dropdown>
                  <Dropdown label="Partidos">
                    <Link to={URLS.PARTIDOS.LIST} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Lista de Partidos
                    </Link>
                    <Link to={URLS.PARTIDOS.CREATE} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Crear Partido
                    </Link>
                  </Dropdown>
                  <Dropdown label="Candidaturas">
                    <Link to={URLS.CANDIDATURAS.LIST} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Lista de Candidaturas
                    </Link>
                    <Link to={URLS.CANDIDATURAS.CREATE} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                      Crear Candidatura
                    </Link>
                  </Dropdown>
                </>
              )}
              {user?.role === 'PADRON' && (
                <Dropdown label="Votantes">
                  <Link to={URLS.VOTANTES.LIST} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                    Lista de Votantes
                  </Link>
                  <Link to={URLS.VOTANTES.CREATE} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded">
                    Crear Votante
                  </Link>
                </Dropdown>
              )}
              {user?.role === 'VOTACION' && (
                <Link
                  to={URLS.HOME}
                  className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
                >
                  VOTACION (placeholder)
                </Link>
              )}
              <Button onClick={handleLogout} variant="danger">
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;