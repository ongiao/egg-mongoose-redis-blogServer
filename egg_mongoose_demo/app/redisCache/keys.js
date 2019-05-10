'use strict'

const OneMinute = 60;
const OneHour = 3600;
const HalfDay = 43200;
const OneDay = 86400;
const OneWeek = 604800;
const OneMonth = 2419200;

module.exports = {
    NowOnlineUser: { keyName: 'NowOnlineUser', expire: HalfDay, commit: '在线用户，过期时间为半天' },
    
}