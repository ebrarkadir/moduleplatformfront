import React, { useEffect, useState } from "react";

const ModuleRenderer = ({ module }) => {
  const [html, setHtml] = useState("");

  useEffect(() => {
    fetch(`/modules/${module}.html`)
      .then((res) => res.text())
      .then(setHtml)
      .catch(() => setHtml("<p>Modül bulunamadı.</p>"));
  }, [module]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default ModuleRenderer;
