import { IfAuthenticated, IfNotAuthenticated } from './Authenticated.tsx'
import { NavGroup, NavButton } from './Styled.tsx'
import { useAuth0 } from '@auth0/auth0-react'

function Nav() {
  // TODO: call the useAuth0 hook and destructure user, logout, and loginWithRedirect
  const { user, logout, loginWithRedirect } = useAuth0()
  // TODO: replace placeholder user object with the one from auth0
  console.log('User:', user)

  const handleSignOut = () => {
    logout()
  }

  const handleSignIn = () => {
    loginWithRedirect()
  }

  return (
    <>
      <NavGroup>
        <IfAuthenticated>
          {user && (
            <div>
              {user.picture && (
                <img
                  src={user.picture}
                  alt="User Profile"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                  }}
                />
              )}
              <p>Signed in as: {user.nickname}</p>
              <p>Name: {user.name}</p>
              <p>Email: {user.email}</p>
            </div>
          )}
          <NavButton onClick={handleSignOut}>Sign out</NavButton>
        </IfAuthenticated>
        <IfNotAuthenticated>
          <NavButton onClick={handleSignIn}>Sign in</NavButton>
        </IfNotAuthenticated>
      </NavGroup>
      <h1>Fruit FTW!</h1>
    </>
  )
}

export default Nav
