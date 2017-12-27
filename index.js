const request          = require("request");
const app              = require("express")();
const requireDirectory = require("require-directory");
const bodyParser       = require("body-parser");
const morgan           = require("morgan");
const config           = require("./config");

const handlers = requireDirectory(module, "./event_handlers", {
    include: /.*?\.js$/
});

// console.log(handlers)

function invokeEventHandlers(state, index = 0) {
    if (index < state.handlers.length) {
        let task;
        try {
            let meta = state.handlers[index];
            task = meta.handler(state).then(
                result => {
                    meta.result = result
                    return invokeEventHandlers(state, index + 1);
                },
                err => {
                    meta.error = String(err)
                    return invokeEventHandlers(state, index + 1);
                }
            );
        } catch (ex) {
            console.error(ex);
            task = invokeEventHandlers(state, index + 1);
        }
        return task;
    }
    return Promise.resolve(state);
}


app.use(morgan("combined"));

app.post("/broadcast", bodyParser.urlencoded({ extended: false }), (req, res) => {
    const state = {
        broadcastedAt: (new Date()).toLocaleString()
    };

    // Validate secret ---------------------------------------------------------
    if (!req.body.secret) {
        return res.status(400).send("missing secret parameter");
    }
    if (req.body.secret !== config.secret) {
        return res.status(400).send("Invalid secret");
    }

    // Validate event type -----------------------------------------------------
    state.event = decodeURIComponent(String(req.body.event || "").trim());
    if (!state.event) {
        return res.status(400).send("Missing event parameter");
    }

    // lookup event handlers ---------------------------------------------------
    const eventHandlers = handlers[state.event];
    if (!eventHandlers) {
        console.warn(`Unknown event ${state.event}`);
    }

    // Validate server ---------------------------------------------------------
    state.server = decodeURIComponent(String(req.body.server || "").trim());
    if (!state.server) {
        return res.status(400).send("Missing server parameter");
    }
    if (!config.allowedServers[state.server]) {
        return res.status(400).send("Forbidden server");
    }

    if (eventHandlers) {
        state.handlers = Object.keys(eventHandlers).map(k => {
            return {
                name   : k,
                handler: eventHandlers[k],
                error  : null,
                result : null
            };
        });
        return invokeEventHandlers(state)
            .catch(err => state.error = String(err))
            .then(() => res.json(state));
    }

    return res.json(state);
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

if (!module.parent) {
    app.listen(config.port, () => {
        console.log(`Example app listening on port ${config.port}!`)
    });
}

module.exports = app;
