/**
 * [description]
 * @param  {[type]} date [description]
 * @return {[type]}      [description]
 */
module.exports = (date) => {
    var yy = date.getFullYear();
    var mm = date.getMonth() + 1;
    var dd = date.getDate();

    return yy + '-' + (mm < 10 ? '0' + mm : mm ) + '-' + (dd < 10 ? '0' + dd : dd);
}

