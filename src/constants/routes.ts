export const ROUTES = {
  home: '/',
  streak: '/streak',
  taskCreated: '/task-created',

  startPage: '/start-page',
  login: '/login',
  register: '/register',
  welcome: '/welcome',

  setDate: '/set-date',
  setTime: '/set-time',
  setTask: '/set-task',
  setProof: '/set-proof',
  sign: '/sign',
  editTask: '/edit-task/[id]',

  reminders: '/reminders-preview',
  reminderInitial: '/notification-1',
  reminderUnstarted: '/notification-2',
  reminderUrgent: '/notification-3',
  reminderPersonal: '/notification-4',
} as const;
