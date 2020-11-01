import React, {
	AllHTMLAttributes,
	PropsWithChildren,
	ReactChildren,
	RefObject,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { unstable_batchedUpdates } from "react-dom";
import SuperVirtualList from "./superVirtualList";
export { SuperVirtualList };

function arrayResolve<R>(
	value: any,
	isArrayFunc: Function,
	notArrayFunc: Function
): R {
	if (Array.isArray(value)) {
		return isArrayFunc(value);
	} else {
		console.error("you must pass array children ");
		return notArrayFunc();
	}
}

export interface VirtualListProps extends AllHTMLAttributes<HTMLDivElement> {
	//滚动dom的ref
	scrollDom: RefObject<HTMLDivElement>;
	//每个元素的高度
	itemHeight: number;
	//渲染出几个元素
	renderNumber: number;
}

export function VirtualList(props: PropsWithChildren<VirtualListProps>) {
	const { children, scrollDom, itemHeight, renderNumber, ...rest } = props;

	const [scrollDomParams, setScrollDomParams] = useState({
		width: 0,
		height: 0,
		top: 0,
		left: 0,
	});

	useEffect(() => {
		if (props.scrollDom.current) {
			const rect = props.scrollDom.current.getBoundingClientRect();
			setScrollDomParams({
				width: rect.width,
				height: rect.height,
				left: rect.left,
				top: rect.top,
			});
		}
	}, [props.scrollDom]);

	const [childrenWrapParams, setChildrenWrapParams] = useState({
		width: 0,
		height: 0,
		top: 0,
		left: 0,
	});

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current) {
			const rect = ref.current.getBoundingClientRect();
			setChildrenWrapParams({
				width: rect.width,
				height: rect.height,
				left: rect.left,
				top: rect.top,
			});
		}
	}, []);

	const wrapperToScrollDomDistance = useMemo(() => {
		return childrenWrapParams.top - scrollDomParams.top;
	}, [childrenWrapParams.top, scrollDomParams.top]);

	const mockHeight = useMemo(() => {
		return arrayResolve<number>(
			props.children,
			(val: any[]) =>
				val.length * props.itemHeight -
				wrapperToScrollDomDistance -
				scrollDomParams.height,
			() => 0
		);
	}, [
		props.children,
		props.itemHeight,
		scrollDomParams.height,
		wrapperToScrollDomDistance,
	]);

	const [renderChildren, setRenderChildren] = useState(
		//一开始，需要返回对应截取的元素
		() => {
			return arrayResolve<ReactChildren>(
				props.children,
				(val: any[]) => val.slice(0, props.renderNumber),
				() => null
			);
		}
	);

	const [viewPortY, setViewPortY] = useState(0);

	useEffect(() => {
		let fn: (e: Event) => void;
		if (props.scrollDom.current) {
			fn = (e: Event) => {
				const target = e.target as HTMLDivElement;
				const scroll = target.scrollTop - scrollDomParams.height;
				const lenth = arrayResolve<number>(
					props.children,
					(val: any[]) => val.length,
					() => 0
				);
				let sindex = Math.floor(scroll / props.itemHeight);
				if (sindex < 0) {
					sindex = 0;
				}
				const remain =
					props.renderNumber + sindex + props.renderNumber > lenth
						? lenth
						: props.renderNumber + props.renderNumber + sindex;

				let Y =
					scroll -
					wrapperToScrollDomDistance -
					scrollDomParams.height;
				if (Y < 0) {
					Y = 0;
				} else if (
					Y >=
					mockHeight - scrollDomParams.height - scrollDomParams.height
				) {
					Y =
						mockHeight -
						scrollDomParams.height -
						scrollDomParams.height;
				}

				unstable_batchedUpdates(() => {
					setRenderChildren(
						arrayResolve<ReactChildren>(
							props.children,
							(val: any[]) => val.slice(0 + sindex, remain),
							() => null
						)
					);
					setViewPortY(Y);
				});
			};

			props.scrollDom.current.addEventListener("scroll", fn);
		}
		return () => {
			if (props.scrollDom.current) {
				//解绑非常重要，否则渲再次出现渲染会出严重问题
				props.scrollDom.current.removeEventListener("scroll", fn);
			}
		};
	}, [
		mockHeight,
		props.children,
		props.itemHeight,
		props.renderNumber,
		props.scrollDom,
		scrollDomParams.height,
		wrapperToScrollDomDistance,
	]);

	return (
		<div
			className="yh-virtuallist"
			style={{ display: "flex", position: "relative", width: "100%" }}
			{...rest}
		>
			<div style={{ height: mockHeight }}></div>
			<div
				ref={ref}
				style={{
					position: "absolute",
					transform: `translate3d(0px, ${viewPortY}px, 0px)`,
					width: "100%",
				}}
			>
				{renderChildren}
				<div style={{ height: "1px" }}></div>
			</div>
		</div>
	);
}

export default VirtualList;
