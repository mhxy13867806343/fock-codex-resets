import { createApp } from 'vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import 'vant/lib/index.css';
import './styles/index.css';
import App from './App.vue';

// Globally extend dayjs with relativeTime and utc
dayjs.extend(relativeTime);
dayjs.extend(utc);

const app = createApp(App);
app.mount('#app');
