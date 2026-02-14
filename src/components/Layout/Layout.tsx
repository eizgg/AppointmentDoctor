import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X, Home, FilePlus, User } from 'lucide-react'
import { appTitle, menuAriaLabel, navItems } from './Layout.strings'
import {
  Wrapper,
  Header,
  MenuButton,
  Title,
  HeaderSpacer,
  Overlay,
  Sidebar,
  SidebarNav,
  SidebarLink,
  Main,
  MainInner,
  BottomNav,
  BottomNavLink,
} from './Layout.styles'

const navItemsConfig = [
  { icon: Home, label: navItems.inicio, to: '/' },
  { icon: FilePlus, label: navItems.nuevaReceta, to: '/nueva-receta' },
  { icon: User, label: navItems.perfil, to: '/perfil' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Wrapper>
      <Header>
        <MenuButton
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={menuAriaLabel}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </MenuButton>
        <Title>{appTitle}</Title>
        <HeaderSpacer />
      </Header>

      {sidebarOpen && <Overlay onClick={() => setSidebarOpen(false)} />}

      <Sidebar $open={sidebarOpen}>
        <SidebarNav>
          {navItemsConfig.map((item) => (
            <SidebarLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </SidebarLink>
          ))}
        </SidebarNav>
      </Sidebar>

      <Main>
        <MainInner>
          <Outlet />
        </MainInner>
      </Main>

      <BottomNav>
        {navItemsConfig.map((item) => (
          <BottomNavLink key={item.to} to={item.to} end={item.to === '/'}>
            <item.icon size={20} />
            <span>{item.label}</span>
          </BottomNavLink>
        ))}
      </BottomNav>
    </Wrapper>
  )
}
