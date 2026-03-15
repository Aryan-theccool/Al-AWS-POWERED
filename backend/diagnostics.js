const fs = require('fs');
exports.handler = async (event) => {
    try {
        console.log('/opt contents:', fs.readdirSync('/opt'));
        if (fs.existsSync('/opt/nodejs')) {
            console.log('/opt/nodejs contents:', fs.readdirSync('/opt/nodejs'));
            if (fs.existsSync('/opt/nodejs/node_modules')) {
                console.log('/opt/nodejs/node_modules sample:', fs.readdirSync('/opt/nodejs/node_modules').slice(0, 5));
            }
        }
    } catch (e) {
        console.warn('Listing /opt failed:', e.message);
    }
    let optInfo = {};
    try {
        optInfo.root = fs.readdirSync('/opt');
        if (fs.existsSync('/opt/nodejs')) {
            optInfo.nodejs = fs.readdirSync('/opt/nodejs');
            if (fs.existsSync('/opt/nodejs/node_modules')) {
                optInfo.node_modules_all = fs.readdirSync('/opt/nodejs/node_modules');
            }
        }
    } catch (e) {
        optInfo.error = e.message;
    }

    try {
        console.log('Attempting static require...');
        const ai = require('@google/generative-ai');
        return { success: true, method: 'require', paths: module.paths, opt: optInfo };
    } catch (err) {
        try {
            const ai = await import('@google/generative-ai');
            return { success: true, method: 'import', paths: module.paths, opt: optInfo };
        } catch (importErr) {
            return { success: false, error: importErr.message, paths: module.paths, opt: optInfo };
        }
    }
};
