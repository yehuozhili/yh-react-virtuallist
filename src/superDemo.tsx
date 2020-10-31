import React, { RefObject } from "react";
import SuperVirtualList from "./components/superVirtualList";

const mockArr = new Array(10000).fill(1).map((x, y) => y);

function SuperDemo(props: { scrollDom: RefObject<HTMLDivElement> }) {
	return (
		<div>
			<div>
				<SuperVirtualList
					scrollDom={props.scrollDom}
					referItemHeight={25}
					renderNumber={30}
				>
					{mockArr.map((v, i) => {
						return (
							<div
								style={{
									border: "1px solid black",
									height: `${Math.random() * 30 + 20}px`,
								}}
								key={i}
							>
								{v}
							</div>
						);
					})}
				</SuperVirtualList>
			</div>
		</div>
	);
}

export default SuperDemo;
