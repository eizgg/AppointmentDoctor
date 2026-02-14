import styled from 'styled-components'
import { NavLink } from 'react-router-dom'

export const Wrapper = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
`

export const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  height: 3.5rem;
  align-items: center;
  justify-content: space-between;
  background-color: #3b82f6;
  padding: 0 1rem;
  color: #fff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  @media (min-width: 1024px) {
    padding-left: 17rem;
  }
`

export const MenuButton = styled.button`
  display: flex;
  height: 2.75rem;
  width: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }

  @media (min-width: 1024px) {
    display: none;
  }
`

export const Title = styled.h1`
  font-size: 1.125rem;
  font-weight: 700;
`

export const HeaderSpacer = styled.div`
  width: 2.75rem;

  @media (min-width: 1024px) {
    display: none;
  }
`

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  background-color: rgba(0, 0, 0, 0.4);

  @media (min-width: 1024px) {
    display: none;
  }
`

export const Sidebar = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 3.5rem;
  bottom: 0;
  left: 0;
  z-index: 20;
  width: 16rem;
  background-color: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: transform 200ms ease-in-out;
  transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(-100%)')};

  @media (min-width: 1024px) {
    transform: translateX(0);
  }
`

export const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
`

export const SidebarLink = styled(NavLink)`
  display: flex;
  height: 2.75rem;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.5rem;
  padding: 0 0.75rem;
  color: #374151;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;

  &:hover {
    background-color: #f3f4f6;
    color: #3b82f6;
  }

  &.active {
    background-color: #eff6ff;
    color: #3b82f6;
    font-weight: 600;
  }
`

export const Main = styled.main`
  padding-top: 3.5rem;
  padding-bottom: 5rem;

  @media (min-width: 1024px) {
    padding-left: 16rem;
    padding-bottom: 1.5rem;
  }
`

export const MainInner = styled.div`
  max-width: 64rem;
  margin: 0 auto;
  padding: 1rem;
`

export const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  height: 4rem;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid #e5e7eb;
  background-color: #fff;

  @media (min-width: 1024px) {
    display: none;
  }
`

export const BottomNavLink = styled(NavLink)`
  display: flex;
  min-height: 2.75rem;
  min-width: 2.75rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.75rem;

  &:hover {
    color: #3b82f6;
  }

  &.active {
    color: #3b82f6;
    font-weight: 600;
  }
`
