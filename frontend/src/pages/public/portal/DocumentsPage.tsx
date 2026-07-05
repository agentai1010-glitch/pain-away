import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePatientDocuments, PatientDocumentResponse } from "@/services/patient-portal";

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { data: documents = [], isLoading, error } = usePatientDocuments();
  
  const [activeTab, setActiveTab] = useState<"RECEIPT" | "BILL" | "PRODUCT">("RECEIPT");
  const [selectedDoc, setSelectedDoc] = useState<PatientDocumentResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("patient_token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500 font-medium">Loading Documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">Failed to load documents.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#2563eb] text-white rounded hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const receipts = documents.filter(d => d.document_type === "BOOKING_RECEIPT");
  const bills = documents.filter(d => d.document_type === "FINAL_BILL");
  // Future placeholder
  const productReceipts: PatientDocumentResponse[] = [];

  let displayDocs = receipts;
  if (activeTab === "BILL") displayDocs = bills;
  if (activeTab === "PRODUCT") displayDocs = productReceipts;

  const getDocumentUrl = (path: string) => {
    // Determine full URL for document. For now, we assume it's served by the backend or a storage provider.
    // Given the document_path in backend, we construct the download URL.
    // In our mocked/local setup, we just return the path directly or prepend API base.
    const baseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "" : "http://localhost:8000");
    return `${baseUrl}/${path}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-[#1e3a8a] text-white py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Receipts & Bills</h1>
          <p className="text-blue-200">View and download your financial documents.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        
        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200 overflow-x-auto">
          <button 
            className={`py-3 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'RECEIPT' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab("RECEIPT")}
          >
            Booking Receipts ({receipts.length})
          </button>
          <button 
            className={`py-3 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'BILL' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab("BILL")}
          >
            Final Bills ({bills.length})
          </button>
          <button 
            className={`py-3 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'PRODUCT' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab("PRODUCT")}
          >
            Product Receipts (0)
          </button>
        </div>

        {/* Content */}
        {displayDocs.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <p className="text-gray-500">No documents available in this section.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayDocs.map(doc => (
              <div key={doc.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 transition hover:shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{doc.document_number}</h3>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-600 border border-gray-200">
                        {doc.document_type.replace("_", " ")}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Generated: </span>
                        <span className="font-medium text-gray-900">{doc.generated_date} at {doc.generated_time}</span>
                      </div>
                      
                      {doc.service_name && (
                        <div>
                          <span className="text-gray-500">Service: </span>
                          <span className="font-medium text-gray-900">{doc.service_name}</span>
                        </div>
                      )}
                      
                      {doc.total_amount !== null && (
                        <div>
                          <span className="text-gray-500">Total Amount: </span>
                          <span className="font-medium text-gray-900">₹ {doc.total_amount}</span>
                        </div>
                      )}
                      
                      {doc.advance_paid !== null && (
                        <div>
                          <span className="text-gray-500">Advance Paid: </span>
                          <span className="font-medium text-gray-900">₹ {doc.advance_paid}</span>
                        </div>
                      )}
                      
                      {doc.remaining_amount !== null && (
                        <div>
                          <span className="text-gray-500">Remaining Amount: </span>
                          <span className="font-medium text-red-600">₹ {doc.remaining_amount}</span>
                        </div>
                      )}
                      
                      {doc.balance_paid !== null && (
                        <div>
                          <span className="text-gray-500">Balance Paid: </span>
                          <span className="font-medium text-gray-900">₹ {doc.balance_paid}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 md:mt-0 md:ml-6 flex flex-row md:flex-col gap-3 min-w-[120px]">
                    <button 
                      onClick={() => setSelectedDoc(doc)}
                      className="flex-1 py-2 px-4 bg-white border border-[#2563eb] text-[#2563eb] text-sm font-medium rounded hover:bg-blue-50 transition text-center"
                    >
                      View
                    </button>
                    <a 
                      href={getDocumentUrl(doc.document_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-4 bg-[#2563eb] text-white text-sm font-medium rounded hover:bg-blue-600 transition text-center flex items-center justify-center gap-2"
                      download
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      PDF
                    </a>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Document Preview</h3>
                <p className="text-sm text-gray-500">{selectedDoc.document_number}</p>
              </div>
              <div className="flex gap-4 items-center">
                <a 
                  href={getDocumentUrl(selectedDoc.document_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#2563eb] hover:underline"
                >
                  Open in New Tab
                </a>
                <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none font-light">&times;</button>
              </div>
            </div>
            
            <div className="flex-1 bg-gray-100 p-4 overflow-hidden relative">
              <iframe 
                src={getDocumentUrl(selectedDoc.document_path)} 
                className="w-full h-full bg-white shadow-sm border border-gray-200 rounded"
                title={`Document ${selectedDoc.document_number}`}
              ></iframe>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
