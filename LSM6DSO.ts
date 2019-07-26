/**
* ST LSM6DSO 3D accelerometer and 3D gyroscope Sensor I2C extension for makecode.
* From microbit/micropython Chinese community.
* https://github.com/makecode-extensions
*/

/**
 * ST LSM6DSO 3D accelerometer and 3D gyroscope Sensor I2C extension
 */
//% weight=100 color=#505060 icon="\uf206" block="LSM6DSO"
namespace LSM6DSO {
    const LSM6DSO_CTRL1_XL = 0x10
    const LSM6DSO_CTRL2_G = 0x11
    const LSM6DSO_CTRL3_C = 0x12
    const LSM6DSO_CTRL6_C = 0x15
    const LSM6DSO_CTRL8_XL = 0x17
    const LSM6DSO_STATUS = 0x1E
    const LSM6DSO_OUT_TEMP_L = 0x20
    const LSM6DSO_OUTX_L_G = 0x22
    const LSM6DSO_OUTY_L_G = 0x24
    const LSM6DSO_OUTZ_L_G = 0x26
    const LSM6DSO_OUTX_L_A = 0x28
    const LSM6DSO_OUTY_L_A = 0x2A
    const LSM6DSO_OUTZ_L_A = 0x2C

    export enum AccelerometerRange {
        //% block="2g"
        range_2g = 0,
        //% block="4g"
        range_4g = 1,
        //% block="8g"
        range_8g = 2,
        //% block="16g"
        range_16g = 3
    }
    const range_a_v = [0, 2, 3, 1]

    export enum AngularmeterRange {
        //% block="125"
        range_125dps = 0,
        //% block="250"
        range_250dps = 1,
        //% block="500"
        range_500dps = 2,
        //% block="1000"
        range_1000dps = 3,
        //% block="2000"
        range_2000dps = 4
    }
    const range_g_v = [1, 0, 2, 4, 6]

    export enum POWER_ONOFF {
        //% block="ON"
        ON = 1,
        //% block="OFF"
        OFF = 0
    }

    export enum LSM6DSO_I2C_ADDRESS {
        //% block="106"
        ADDR_106 = 106,
        //% block="107"
        ADDR_107 = 107
    }

    export enum Dimension {
        //% block="Strength"
        Strength = 0,
        //% block="X"
        X = 1,
        //% block="Y"
        Y = 2,
        //% block="Z"
        Z = 3
    }

    export enum LSM6DSO_T_UNIT {
        //% block="C"
        C = 0,
        //% block="F"
        F = 1
    }

    let I2C_ADDR = LSM6DSO_I2C_ADDRESS.ADDR_107

    // ODR_XL = 4 FS_XL= 0
    setreg(LSM6DSO_CTRL1_XL, 0x40)
    // ODR_G = 4 FS_125= 1
    setreg(LSM6DSO_CTRL2_G, 0x42)
    // BDU = 1 IF_INC= 1
    setreg(LSM6DSO_CTRL3_C, 0x44)
    setreg(LSM6DSO_CTRL8_XL, 0)
    // scale = 2G
    let _range_a = 0
    let _range_g = 0
    setAccelerometerRange(LSM6DSO.AccelerometerRange.range_2g)
    setAngularmeterRange(LSM6DSO.AngularmeterRange.range_125dps)

    // set dat to reg
    function setreg(reg: number, dat: number): void {
        let tb = pins.createBuffer(2)
        tb[0] = reg
        tb[1] = dat
        pins.i2cWriteBuffer(I2C_ADDR, tb)
    }

    // read a Int8LE from reg
    function getInt8LE(reg: number): number {
        pins.i2cWriteNumber(I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(I2C_ADDR, NumberFormat.Int8LE);
    }

    // read a UInt8LE from reg
    function getUInt8LE(reg: number): number {
        pins.i2cWriteNumber(I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(I2C_ADDR, NumberFormat.UInt8LE);
    }

    // read a Int16LE from reg
    function getInt16LE(reg: number): number {
        pins.i2cWriteNumber(I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(I2C_ADDR, NumberFormat.Int16LE);
    }

    // read a UInt16LE from reg
    function getUInt16LE(reg: number): number {
        pins.i2cWriteNumber(I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(I2C_ADDR, NumberFormat.UInt16LE);
    }

    // set a mask dat to reg
    function setreg_mask(reg: number, dat: number, mask: number): void {
        setreg(reg, (getUInt8LE(reg) & mask) | dat)
    }

    // convert raw data to mg
    function ConvertTomg(reg: number) {
        return Math.round(getInt16LE(reg) * 0.061 * (1 << _range_a))
    }

    /**
     * get motion value (mg)
     */
    //% block="acceleration (mg) %dim"
    export function acceleration(dim: LSM6DSO.Dimension = LSM6DSO.Dimension.X): number {
        switch (dim) {
            case Dimension.X:
                return ConvertTomg(LSM6DSO_OUTX_L_A)
            case Dimension.Y:
                return ConvertTomg(LSM6DSO_OUTY_L_A)
            case Dimension.Z:
                return ConvertTomg(LSM6DSO_OUTZ_L_A)
            default:
                return Math.round(Math.sqrt(ConvertTomg(LSM6DSO_OUTX_L_A) ** 2 + ConvertTomg(LSM6DSO_OUTY_L_A) ** 2 + ConvertTomg(LSM6DSO_OUTZ_L_A) ** 2))
        }
    }

    // convert raw data to mdps
    function ConvertTomdps(reg: number) {
        return Math.round(getInt16LE(reg) * 4.375 * (1 << _range_g))
    }

    /**
     * get motion value (mg)
     */
    //% block="angular (mdps) %dim"
    export function angular(dim: LSM6DSO.Dimension = LSM6DSO.Dimension.X): number {
        switch (dim) {
            case Dimension.X:
                return ConvertTomdps(LSM6DSO_OUTX_L_G)
            case Dimension.Y:
                return ConvertTomdps(LSM6DSO_OUTY_L_G)
            case Dimension.Z:
                return ConvertTomdps(LSM6DSO_OUTZ_L_G)
            default:
                return Math.round(Math.sqrt(ConvertTomdps(LSM6DSO_OUTX_L_G) ** 2 + ConvertTomdps(LSM6DSO_OUTY_L_G) ** 2 + ConvertTomdps(LSM6DSO_OUTZ_L_G) ** 2))
        }
    }

    /**
     * get X/Y/Z-axis acceleration and angular at once
     */
    //% block="get"
    export function get(): number[] {
        return [ConvertTomg(LSM6DSO_OUTX_L_A), ConvertTomg(LSM6DSO_OUTY_L_A), ConvertTomg(LSM6DSO_OUTZ_L_A), ConvertTomdps(LSM6DSO_OUTX_L_G), ConvertTomdps(LSM6DSO_OUTY_L_G), ConvertTomdps(LSM6DSO_OUTZ_L_G)]
    }

    /**
     * set sensor power on/off
     */
    //% block="power %on"
    export function power(on: LSM6DSO.POWER_ONOFF = LSM6DSO.POWER_ONOFF.ON) {
        let a = (on) ? 0x40 : 0x00
        let g = (on) ? 0x40 : 0x00
        setreg_mask(LSM6DSO_CTRL1_XL, a, 0x0F)
        setreg_mask(LSM6DSO_CTRL2_G, g, 0x0F)
    }

    /**
     * set Accelerometer Range
     */
    //% block="setAccelerometerRange (g) %range"
    export function setAccelerometerRange(range: LSM6DSO.AccelerometerRange = LSM6DSO.AccelerometerRange.range_2g) {
        _range_a = range
        setreg_mask(LSM6DSO_CTRL1_XL, range_a_v[range] << 2, 0xF3)
    }

    /**
     * set Angularmeter Range
     */
    //% block="setAngularmeterRange (dps) %range"
    export function setAngularmeterRange(range: LSM6DSO.AngularmeterRange = LSM6DSO.AngularmeterRange.range_125dps) {
        _range_g = range
        setreg_mask(LSM6DSO_CTRL2_G, range_g_v[range] << 1, 0xF1)
    }

    /**
     * get temperature from sensor
     */
    //% block="temperature %u"
    export function temperature(u: LSM6DSO.LSM6DSO_T_UNIT = LSM6DSO.LSM6DSO_T_UNIT.C) {
        let T = getInt8LE(LSM6DSO_OUT_TEMP_L + 1) + 25
        if (u) T = Math.round(32 + T * 9 / 5)
        return T
    }
}
