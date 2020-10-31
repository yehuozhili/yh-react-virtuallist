import React, { RefObject } from "react";
import VirtualList from "./components";

const mockArr = new Array(10000).fill(1).map((x, y) => y);

function GrandChild(props: { scrollDom: RefObject<HTMLDivElement> }) {
	return (
		<div>
			this text in the current component
			<div>
				<VirtualList
					renderNumber={25}
					itemHeight={30}
					scrollDom={props.scrollDom}
				>
					{mockArr.map((v, i) => {
						return (
							<div
								style={{
									border: "1px solid black",
									height: "30px",
								}}
								key={i}
							>
								{v}
							</div>
						);
					})}
				</VirtualList>
			</div>
		</div>
	);
}

export default GrandChild;
