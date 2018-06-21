const fs = require('fs');
const { List } = require('immutable');

/**
 * [mkdir 创建文件夹，使用Promise实现]
 * @param  {[String]} path [目录路径]
 * @return {[Promise]}      [返回Promise]
 */
const mkdir = (path) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, err => {
            if (err && err.code !== 'EEXIST') {
                console.log(err);
                return reject(err);
            }
            resolve();
        });
    });
}

/**
 * [makeMultilevelDir 创建多级目录] 
 * @param  {[List]} list [多级目录的层级list]
 * @return {[Promise]}      [返回Promise]
 */
const makeMultilevelDir = (catalogList) => {
    return mkdir(catalogList.get(0)).then(() => {
        if (catalogList.size === 1) {
            return '创建成功';
        }
        const nextLevelCatalog = catalogList.set(0, `${catalogList.get(0)}/${catalogList.get(1)}`).delete(1);
        return makeMultilevelDir(nextLevelCatalog);
    });
}

/**
 * [创建目录]
 * @param  {[String]} path [目录路径]
 * @return {[Promise]}      [返回Promise]
 */
module.exports = (path) => {
    const pathCatalog = List(path.split('/'));
    return makeMultilevelDir(pathCatalog);
}