basic.forever(function () {
    serial.writeNumbers(LSM6DSO.get())
    basic.pause(1000)
})