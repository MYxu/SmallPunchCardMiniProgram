// 将时间（秒）转换成 '00:00'格式
const formatSeconds = (s) => {
    let str = "";
    if(s > 0){
        const minutes = Math.floor(s / 60);
        const seconds = Math.floor(s - minutes * 60);
        let m_str = minutes < 10 ? "0" + minutes : minutes;
        let s_str = seconds < 10 ? "0" + seconds : seconds;
        str = m_str + ":" + s_str;
    } else {
        str = "00:00";
    }
    return str;
};

module.exports = {
    formatSeconds: formatSeconds
};