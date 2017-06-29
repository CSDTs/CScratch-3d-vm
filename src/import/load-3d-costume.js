const got = require('got');

const load3DCostume = function (filepath, costume, runtime) {
    return new Promise((resolve, reject) => {
        if (filepath.split('.').pop() !== 'json') {
            resolve(undefined);
        }
        got(filepath).then(
            response => {
                if (response.statusCode === 200) {
                    resolve(response.body);
                } else {
                    reject(response);
                }
            },
            error => {
                reject(error);
            }
        )
    }).then(costumeAsset => {
        debugger;
        costume.skinId = runtime.renderer.create3DSkin(JSON.parse(costumeAsset));
        return costume;
    })
};

module.exports = load3DCostume;
