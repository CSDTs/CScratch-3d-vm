const Cast = require('../util/cast');
const MathUtil = require('../util/math-util');
const Timer = require('../util/timer');

class Scratch3MotionBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            motion_rotate: this.rotate,
            motion_setrotation: this.setRotation,
            motion_gotoxyz: this.goToXYZ,
            motion_changexby: this.changeX,
            motion_setx: this.setX,
            motion_changeyby: this.changeY,
            motion_sety: this.setY,
            motion_changezby: this.changeZ,
            motion_setz: this.setZ,
            motion_xposition: this.getX,
            motion_yposition: this.getY,
            motion_zposition: this.getZ
        };
    }

    rotate (args, util) {
        const x = Cast.toNumber(args.DEGREESX);
        const y = Cast.toNumber(args.DEGREESY);
        const z = Cast.toNumber(args.DEGREESZ);
        util.target.setRotation(
            util.target.rotation[0] + x,
            util.target.rotation[1] + y,
            util.target.rotation[2] + z
        )
    }

    setRotation (args, util) {
        const x = Cast.toNumber(args.DEGREESX);
        const y = Cast.toNumber(args.DEGREESY);
        const z = Cast.toNumber(args.DEGREESZ);
        util.target.setRotation(x, y, z);
    }


    goToXYZ (args, util) {
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        const z = Cast.toNumber(args.Z);
        util.target.setXYZ(x, y, z);
    }

    changeX (args, util) {
        const dx = Cast.toNumber(args.DX);
        util.target.setXYZ(util.target.x + dx, util.target.y, util.target.z);
    }

    setX (args, util) {
        const x = Cast.toNumber(args.X);
        util.target.setXYZ(x, util.target.y);
    }

    changeY (args, util) {
        const dy = Cast.toNumber(args.DY);
        util.target.setXYZ(util.target.x, util.target.y + dy, util.target.z);
    }

    setY (args, util) {
        const y = Cast.toNumber(args.Y);
        util.target.setXYZ(util.target.x, y, util.target.z);
    }

    changeZ (args, util) {
        const dz = Cast.toNumber(args.DZ);
        util.target.setXYZ(util.target.x, util.target.y, util.target.z + dz);
    }

    setZ (args, util) {
        const z = Cast.toNumber(args.Z);
        util.target.setXYZ(util.target.x, util.target.y, z);
    }

    getX (args, util) {
        return util.target.x;
    }

    getY (args, util) {
        return util.target.y;
    }

    getZ (args, util) {
        return util.target.z;
    }
}

module.exports = Scratch3MotionBlocks;
