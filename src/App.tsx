import React from "react";
import Child from "./child";

function App() {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<div style={{ padding: "10px", fontSize: "20px" }}>Mock Title </div>
			<div style={{ padding: "10px", fontSize: "20px" }}>
				it mock have distance from the top
			</div>
			<Child></Child>
		</div>
	);
}

export default App;
