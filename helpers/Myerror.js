const MsgError = (res) => {
    res.status(400).json({
        msg:'Hubo un error',
    })
}

module.exports = {MsgError}