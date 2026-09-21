import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-lg border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl mx-auto flex items-center justify-center font-bold text-2xl">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              เกิดข้อผิดพลาดในการแสดงผล
            </h2>
            <p className="text-sm text-slate-600">
              {this.state.error?.message || 'ระบบเกิดข้อผิดพลาดไม่คาดคิด กรุณารีเฟรชหน้าเว็บหรือกดปุ่มด้านล่างเพื่อโหลดใหม่'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-xs hover:bg-blue-700 transition-colors"
            >
              โหลดหน้านี้ใหม่ (Reload App)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
