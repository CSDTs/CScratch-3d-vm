const Cast = require('../util/cast');
const MathUtil = require('../util/math-util');

class Scratch3LooksBlocks {
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
            looks_say: this.say,
            looks_sayforsecs: this.sayforsecs,
            looks_think: this.think,
            looks_thinkforsecs: this.sayforsecs,
            looks_show: this.show,
            looks_hide: this.hide,
            looks_switchcostumeto: this.switchCostume,
            looks_switchbackdropto: this.switchBackdrop,
            looks_switchbackdroptoandwait: this.switchBackdropAndWait,
            looks_nextcostume: this.nextCostume,
            looks_nextbackdrop: this.nextBackdrop,
            looks_setscaleto: this.setScale,
            looks_costumeorder: this.getCostumeIndex,
            looks_backdroporder: this.getBackdropIndex,
            looks_backdropname: this.getBackdropName,
            looks_setcamerato: this.setCamera,
            looks_changecameraxby: this.changeCameraX,
            looks_changecamerayby: this.changeCameraY,
            looks_changecamerazby: this.changeCameraZ,
            looks_turncameraaroundx: this.turnCameraX,
            looks_turncameraaroundy: this.turnCameraY,
            looks_turncameraaroundz: this.turnCameraZ
        };
    }

    say (args, util) {
        util.target.setSay('say', args.MESSAGE);
    }

    sayforsecs (args, util) {
        util.target.setSay('say', args.MESSAGE);
        return new Promise(resolve => {
            setTimeout(() => {
                // Clear say bubble and proceed.
                util.target.setSay();
                resolve();
            }, 1000 * args.SECS);
        });
    }

    think (args, util) {
        util.target.setSay('think', args.MESSAGE);
    }

    thinkforsecs (args, util) {
        util.target.setSay('think', args.MESSAGE);
        return new Promise(resolve => {
            setTimeout(() => {
                // Clear say bubble and proceed.
                util.target.setSay();
                resolve();
            }, 1000 * args.SECS);
        });
    }

    show (args, util) {
        util.target.setVisible(true);
    }

    hide (args, util) {
        util.target.setVisible(false);
    }

    /**
     * Utility function to set the costume or backdrop of a target.
     * Matches the behavior of Scratch 2.0 for different types of arguments.
     * @param {!Target} target Target to set costume/backdrop to.
     * @param {Any} requestedCostume Costume requested, e.g., 0, 'name', etc.
     * @param {boolean=} optZeroIndex Set to zero-index the requestedCostume.
     * @return {Array.<!Thread>} Any threads started by this switch.
     */
    _setCostumeOrBackdrop (target,
            requestedCostume, optZeroIndex) {
        if (typeof requestedCostume === 'number') {
            target.setCostume(optZeroIndex ?
                requestedCostume : requestedCostume - 1);
        } else {
            const costumeIndex = target.getCostumeIndexByName(requestedCostume);
            if (costumeIndex > -1) {
                target.setCostume(costumeIndex);
            } else if (requestedCostume === 'previous costume' ||
                       requestedCostume === 'previous backdrop') {
                target.setCostume(target.currentCostume - 1);
            } else if (requestedCostume === 'next costume' ||
                       requestedCostume === 'next backdrop') {
                target.setCostume(target.currentCostume + 1);
            } else {
                const forcedNumber = Number(requestedCostume);
                if (!isNaN(forcedNumber)) {
                    target.setCostume(optZeroIndex ?
                        forcedNumber : forcedNumber - 1);
                }
            }
        }
        if (target === this.runtime.getTargetForStage()) {
            // Target is the stage - start hats.
            const newName = target.sprite.costumes[target.currentCostume].name;
            return this.runtime.startHats('event_whenbackdropswitchesto', {
                BACKDROP: newName
            });
        }
        return [];
    }

    switchCostume (args, util) {
        this._setCostumeOrBackdrop(util.target, args.COSTUME);
    }

    nextCostume (args, util) {
        this._setCostumeOrBackdrop(
            util.target, util.target.currentCostume + 1, true
        );
    }

    switchBackdrop (args) {
        this._setCostumeOrBackdrop(this.runtime.getTargetForStage(), args.BACKDROP);
    }

    switchBackdropAndWait (args, util) {
        // Have we run before, starting threads?
        if (!util.stackFrame.startedThreads) {
            // No - switch the backdrop.
            util.stackFrame.startedThreads = (
                this._setCostumeOrBackdrop(
                    this.runtime.getTargetForStage(),
                    args.BACKDROP
                )
            );
            if (util.stackFrame.startedThreads.length === 0) {
                // Nothing was started.
                return;
            }
        }
        // We've run before; check if the wait is still going on.
        const instance = this;
        const waiting = util.stackFrame.startedThreads.some(thread => instance.runtime.isActiveThread(thread));
        if (waiting) {
            util.yield();
        }
    }

    nextBackdrop () {
        const stage = this.runtime.getTargetForStage();
        this._setCostumeOrBackdrop(
            stage, stage.currentCostume + 1, true
        );
    }

    setScale (args, util) {
        const x = Cast.toNumber(args.SCALEX);
        const y = Cast.toNumber(args.SCALEY);
        const z = Cast.toNumber(args.SCALEZ);
        util.target.setScale([x, y, z]);
    }

    getBackdropIndex () {
        const stage = this.runtime.getTargetForStage();
        return stage.currentCostume + 1;
    }

    getBackdropName () {
        const stage = this.runtime.getTargetForStage();
        return stage.sprite.costumes[stage.currentCostume].name;
    }

    getCostumeIndex (args, util) {
        return util.target.currentCostume + 1;
    }

    setCamera (args, util) {
        if (!util.target.isStage) return;
        this.runtime.renderer.cameraPosition = [
            Cast.toNumber(args.X),
            Cast.toNumber(args.Y),
            Cast.toNumber(args.Z)
        ];
    }

    changeCameraX (args, util) {
        if (!util.target.isStage) return;
        const renderer = this.runtime.renderer;
        const currentPosition = renderer.cameraPosition;
        renderer.cameraPosition = [
            currentPosition[0] + Cast.toNumber(args.DX),
            currentPosition[1],
            currentPosition[2]
        ];
    }

    changeCameraY (args, util) {
        if (!util.target.isStage) return;
        const renderer = this.runtime.renderer;
        const currentPosition = renderer.cameraPosition;
        renderer.cameraPosition = [
            currentPosition[0],
            currentPosition[1] + Cast.toNumber(args.DY),
            currentPosition[2]
        ];
    }

    changeCameraZ (args, util) {
        if (!util.target.isStage) return;
        const renderer = this.runtime.renderer;
        const currentPosition = renderer.cameraPosition;
        renderer.cameraPosition = [
            currentPosition[0],
            currentPosition[1],
            currentPosition[2] + Cast.toNumber(args.DX)
        ];
    }

    _rotatePoint (x, y, deg) {
        const radians = MathUtil.degToRad(deg);
        const sin = Math.sin(radians);
        const cos = Math.cos(radians);

        return [x * cos - y * sin, x * sin + y * cos];
    }

    turnCameraX (args, util) {
        debugger;
        if (!util.target.isStage) return;
        const renderer = this.runtime.renderer;
        const position = renderer.cameraPosition;
        const newCoords = this._rotatePoint(position[1], position[2], Cast.toNumber(args.DEGREES));
        renderer.cameraPosition = [
            position[0],
            newCoords[0],
            newCoords[1]
        ];
    }

    turnCameraY (args, util) {
        if (!util.target.isStage) return;
        const renderer = this.runtime.renderer;
        const position = renderer.cameraPosition;
        const newCoords = this._rotatePoint(position[0], position[2], Cast.toNumber(args.DEGREES));
        renderer.cameraPosition = [
            newCoords[0],
            position[1],
            newCoords[1]
        ];
    }

    turnCameraZ (args, util) {
        if (!util.target.isStage) return;
        const renderer = this.runtime.renderer;
        const position = renderer.cameraPosition;
        const newCoords = this._rotatePoint(position[0], position[1], Cast.toNumber(args.DEGREES));
        renderer.cameraPosition = [
            newCoords[0],
            newCoords[1],
            position[2]
        ];
    }
}

module.exports = Scratch3LooksBlocks;
