import React, { useEffect, useState } from "react";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import { getContentList, deleteContentById } from "./DB";
import EnhancedTable from "./EnhancedTable";

export default function UserLibrary() {
  const [userContent, setUserContent] = useState([]);
  const [dbRead, setDBRead] = useState(false);

  useEffect(() => {
    if (dbRead) {
      return;
    }
    getContentList().then((contentList) => {
      const contentArray = [];
      Promise.all(
        contentList.map((docPromise) => {
          return docPromise.then((doc) => {
            if (doc && doc.title) {
              contentArray.push(doc);
            }
          });
        })
      ).then(() => {
        setUserContent(contentArray);
      });
      setDBRead(true);
    });
  });

  const deleteRow = (contentId) => {
    return deleteContentById(contentId).then(() => {
      setDBRead(false);
    });
  };

  return (
    <TableContainer component={Paper}>
      <EnhancedTable
        rows={userContent}
        deleteContentById={deleteRow}
        path="/table"
      />
    </TableContainer>
  );
}
