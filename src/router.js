import Router from 'vue-router'
import CloudContent from './components/CloudContent'
import DashBoard from './components/DashBoard'
import Login from './components/Login'
import Player from './components/Player'
import 'element-ui/lib/theme-default/index.css'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/',
    component: CloudContent,
    children: [
      {
        path: '/dashboard',
        component: DashBoard,
        name: 'dashboard'
      },
      {
        path: '/player',
        component: Player,
        name: 'player'
      }
    ]
  }
]

var router = new Router({
  routes: routes,
  mode: 'history',
  linkActiveClass: 'is-active'
})

export default router
