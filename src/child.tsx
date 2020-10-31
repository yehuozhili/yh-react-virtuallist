import React, { useRef } from "react";
import GrandChild from "./grandChild";
import SuperDemo from "./superDemo";

function Child() {
	const ref = useRef<HTMLDivElement>(null);
	const ref2 = useRef<HTMLDivElement>(null);
	return (
		<div style={{ display: "flex" }}>
			<div
				style={{
					height: "500px",
					border: "1px solid black",
					overflow: "auto",
				}}
				ref={ref}
			>
				child use to mock scroll dom. this text in the scroll dom.
				<GrandChild scrollDom={ref}></GrandChild>
			</div>
			<div
				style={{
					height: "500px",
					border: "1px solid black",
					overflow: "auto",
				}}
				ref={ref2}
			>
				child use to mock scroll dom. this text in the scroll dom.
				<SuperDemo scrollDom={ref2}></SuperDemo>
			</div>
		</div>
	);
}

export default Child;
