import React from "react"

const LoadingOBResultsComponent = () => {
	return (
		<div className="flex w-full items-center justify-center mt-7 pb-7">
			<div
				className="w-[200px] h-[100px] my-0 mx-auto bg-no-repeat bg-contain bg-center"
				style={{
					backgroundImage: "url(/animations/uplist_arrow_animation.gif)",
				}}
			></div>
		</div>
	)
}

export default LoadingOBResultsComponent
