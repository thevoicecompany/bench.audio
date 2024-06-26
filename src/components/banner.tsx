export default function Banner() {
  return (
    <>
      {/*
        Make sure you add some bottom padding to pages that include a sticky banner like this to prevent
        your content from being obscured when the user scrolls to the bottom of the page.
      */}
      <div className="fixed inset-x-0 bottom-0">
        <div className="flex items-center gap-x-6 bg-neptune-blue-900 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
          <p className="text-sm leading-6 text-white">
            <a
              href="https://sfvoice.company"
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* <strong className="font-semibold">GeneriCon 2023</strong> */}
              {/* <svg
                viewBox="0 0 2 2"
                className="mx-2 inline h-0.5 w-0.5 fill-current"
                aria-hidden="true"
              >
                <circle cx={1} cy={1} r={1} />
              </svg> */}
              made with ❤️ by the sf voice company
              {/* <span aria-hidden="true">&rarr;</span> */}
            </a>
          </p>
          <div className="flex flex-1 justify-end">
            {/* <button
              type="button"
              className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5 text-white" aria-hidden="true" />
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
}
