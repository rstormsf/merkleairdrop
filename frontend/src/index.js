import React from "react"
import { render } from "react-dom"

import registerServiceWorker from "./registerServiceWorker"
import AppWrapper from "./Components/AppWrapper"

render(<AppWrapper />, document.getElementById("root"))
registerServiceWorker()
