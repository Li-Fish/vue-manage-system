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
    var time = year + '-' + month + '-' + date + '  ' + hour + ':' + min + ':' + sec ;
    return time;
}

export function dateToInt(time) {
    var sec = time.getMonth();
    var min = time.getDate();
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