import React from "react";

/**
 *
 * @param timeout : number (optional)
 * @returns  boolean
 * @description : This hook is used to check if the page is loaded or not. Specify timeout in milliseconds to delay the page loaded state. i.e 1000, not 1
 */
function usePageLoaded(timeout?: number) {
  const [pageLoaded, setPageLoaded] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setPageLoaded(true);
    }, timeout ?? 1000);
  }, [timeout]);

  return pageLoaded;
}

export default usePageLoaded;
