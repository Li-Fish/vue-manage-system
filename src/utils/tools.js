export function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = a.getMonth();
    var date = a.getDate();
    var hour = a.getHours();
    if (hour < 10) {
        hour = '0' + hour
    }
    var min = a.getMinutes();
    if (min < 10) {
        min = '0' + min
    }
    var sec = a.getSeconds();
    if (sec < 10) {
        sec = '0' + sec
    }
    var time = year + '-' + (month+1) + '-' + date + '  ' + hour + ':' + min + ':' + sec ;
    return time;
}

export function getWeek(date) {
    var week = date.getDay();
    var str
    if (week === 0) {
        str = '周日';
    } else if (week === 1) {
        str = '周一';
    } else if (week === 2) {
        str = '周二';
    } else if (week === 3) {
        str = '周三';
    } else if (week === 4) {
        str = '周四';
    } else if (week === 5) {
        str = '周五';
    } else if (week === 6) {
        str = '周六';
    }
    return str
}

export function dateToInt(time) {
    var sec = time.getSeconds();
    var min = time.getMinutes();
    var hour = time.getHours();

    return hour * 60 * 60 + min * 60 + sec
}

export function intToDate(num) {
    let hour = num / 3600
    let min = num / 60 % 60
    let sec = num % 60
    let a = new Date()
    a.setHours(hour)
    a.setMinutes(min)
    a.setSeconds(sec)
    console.log(a)
    return a
}