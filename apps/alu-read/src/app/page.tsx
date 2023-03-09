"use client";
import React, { useEffect } from "react";
import Sidebar from "../../lib/Sidebar";
import ArticleReader from "../../lib/ArticleReader/ArticleReader";
import "./style.css";
import LearnSidebar from "../../lib/LearnSidebar";

const App: React.FC = () => {
  useEffect(() => {
    window.appApi.receive("app", (event) => {
      console.log("Received event from main ", event);
      alert("Received event from main " + event.action);
    });
  }, []);

  return (
    <div className="grid grid-cols-12 w-full h-screen relative overflow-clip">
      <aside className="col-span-3 h-screen sticky top-0 overflow-y-scroll no-scrollbar bg-stone-50 border-r-4 border-r-stone-200">
        <Sidebar />
      </aside>
      <div className="col-span-6 h-screen overflow-y-scroll no-scrollbar">
        <ArticleReader />
      </div>
      <aside className="col-span-3 h-screen sticky top-0 overflow-y-scroll">
        <LearnSidebar />
      </aside>
    </div>
  );
};

export default App;
