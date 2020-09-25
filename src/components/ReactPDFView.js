import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { pdfjs, Document, Outline, Page } from "react-pdf";
import { ButtonGroup, Button, Grid, makeStyles, Fade } from "@material-ui/core";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import Modal from "@material-ui/core/Modal";
import useEventListener from "./useEventListener";
import "../../node_modules/tocca/Tocca";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const useStyles = makeStyles((theme) => ({
  navContainer: {
    position: "absolute",
    top: 0.8 * window.innerHeight,
    backgroundColor: "transparent",
  },
  zoomContainer: {
    position: "absolute",
    top: 5,
    backgroundColor: "transparent",
  },
  paper: {
    position: "absolute",
    width: "100vw",
    height: "auto",
    maxWidth: "none",
    maxHeight: "100vh",
    objectFit: "contain",
  },
  modal: {
    display: "flex",
    backgroundColor: theme.palette.background.dark,
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function ReactPDFView({
  fileUrl,
  width,
  height,
  position,
  pageChange,
}) {
  const classes = useStyles();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [open, setOpen] = useState(false);
  const [pageWidth, setPageWidth] = useState(width);
  const [pageHeight, setPageHeight] = useState(height);
  const [pageScale, setPageScale] = useState(1);
  const [showNav, setShowNav] = useState(true);
  const pdfRef = useRef(null);

  useEffect(() => {
    if (position) {
      setPageNumber(position);
    }
  }, [position]);

  const handleNextPage = (e) => {
    if (pageNumber < numPages) {
      const newPageNumber = pageNumber + 1;
      setPageNumber(newPageNumber);
      if (pageChange) pageChange(newPageNumber, numPages);
    }
  };

  const handlePrevPage = (e) => {
    if (pageNumber > 1) {
      const newPageNumber = pageNumber - 1;
      setPageNumber(newPageNumber);
      if (pageChange) pageChange(newPageNumber, numPages);
    }
  };

  const handleKeyDown = (e) => {
    const { key } = e;
    if (key === "ArrowRight") {
      handleNextPage(e);
    } else if (key === "ArrowLeft") {
      handlePrevPage(e);
    }
  };

  const handleMousemove = async (e) => {
    setShowNav(true);
  };

  const resetFadeTimer = () => {
    const timer = setTimeout(() => {
      setShowNav(false);
    }, 5000);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    resetFadeTimer();
  }, [showNav]);

  useEventListener(document, "keydown", handleKeyDown);
  useEventListener(pdfRef, "swipeleft", handleNextPage);
  useEventListener(pdfRef, "swiperight", handlePrevPage);
  useEventListener(pdfRef, "mousemove", handleMousemove);

  const zoomIn = () => {
    if (width) {
      setPageWidth(1.1 * pageWidth);
    } else if (height) {
      setPageHeight(1.1 * pageHeight);
    }
  };

  const zoomOut = () => {
    if (width) {
      setPageWidth(pageWidth / 1.1);
    } else if (height) {
      setPageHeight(pageHeight / 1.1);
    }
  };
  const resetZoom = () => {
    if (width) {
      setPageWidth(width);
    } else if (height) {
      setPageHeight(height);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  function onDocumentLoadSuccess(pdf) {
    setNumPages(pdf.numPages);
  }

  function onPageLoadSuccess(page) {
    // console.log(page);
    // console.log(page.width, page.height, pageWidth, pageHeight);
    // console.log(page.originalWidth, page.originalHeight, width, height);
    const scale = Math.min(
      width / page.originalWidth,
      height / page.originalHeight
    );
    // console.log(scale);
    setPageScale(scale);
    // setNumPages(pdf.numPages);
  }

  function onItemClick({ pageNumber: itemPageNumber }) {
    setPageNumber(itemPageNumber);
  }

  const body = (
    <div ref={pdfRef}>
      <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
        <Page
          onLoadSuccess={onPageLoadSuccess}
          pageNumber={pageNumber || 1}
          renderAnnotationLayer={false}
          scale={pageScale}
          // width={pageWidth}
          // height={pageHeight}
        />
        <Outline onItemClick={onItemClick} />
      </Document>
      <Fade in={showNav}>
        <Grid container justify="center" className={classes.zoomContainer}>
          <ButtonGroup variant="text">
            <Button onClick={zoomIn}>
              <ZoomInIcon />
            </Button>
            <Button onClick={resetZoom}>Reset</Button>
            <Button onClick={zoomOut}>
              <ZoomOutIcon />
            </Button>
          </ButtonGroup>
        </Grid>
      </Fade>
      <Fade in={showNav}>
        <Grid container justify="center" className={classes.navContainer}>
          {numPages && showNav && (
            <ButtonGroup size="medium" color="primary" variant="contained">
              <Button
                variant="contained"
                color="primary"
                onClick={handlePrevPage}
              >
                &lt;&lt; Prev
              </Button>
              <Button color="inherit">{`${pageNumber} of ${numPages}`}</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNextPage}
              >
                Next &gt;&gt;
              </Button>
            </ButtonGroup>
          )}
        </Grid>
      </Fade>
    </div>
  );

  if (!open) {
    return <div style={{ position: "relative" }}>{body}</div>;
  }

  if (open) {
    return (
      <>
        <Modal
          className={classes.modal}
          open={open}
          onClose={handleClose}
          disableBackdropClick
        >
          <div className={classes.paper}>{body}</div>
        </Modal>
      </>
    );
  }
}

ReactPDFView.propTypes = {
  fileUrl: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  pageChange: PropTypes.func,
};
