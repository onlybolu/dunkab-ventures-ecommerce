 


 const Middow = () => {
    return(
        <div className="bg-black/70 text-[12px] text-white flex justify-between items-center py-2 px-4">
        <div className="flex items-center gap-4">
          <p className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-telephone-fill"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"
              />
            </svg>

            <a
              href="tel:+23408037466334"
              className="underline-0 hover:underline"
            >
              call us: 08037466334 {","}
            </a>
            <a
              href="tel:+23408028414639"
              className="underline-0 hover:underline"
            >
              08028414639
            </a>
          </p>

          <p className="md:flex hidden items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-clock"
              viewBox="0 0 16 16"
            >
              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
            </svg>
            <span className="underline-0 hover:underline">
              Mon - Sat: 8am - 6pm
            </span>
          </p>
        </div>
        <div className="md:flex hidden items-center gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-geo-alt-fill"
            viewBox="0 0 16 16"
          >
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
          </svg>
            <a 
            href="https://maps.app.goo.gl/eK58YSi4u6j38vcS8"
             className="underline-0 hover:underline"
             target="_blank"
  rel="noopener noreferrer"
             >
              View us on map
            </a>
        </div>
      </div>
    )
 }

 export default Middow;