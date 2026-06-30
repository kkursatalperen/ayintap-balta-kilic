'use client';
import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Admin panel hatasi:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 flex flex-col items-center justify-center text-center">
          <AlertTriangle className="text-red-500 mb-4" size={40} />
          <h2 className="font-serif text-2xl text-amber-50 mb-2">Bir seyler ters gitti</h2>
          <p className="text-amber-100/60 mb-6 max-w-md">
            Bu bolum yuklenirken bir hata olustu. Diger sekmeleri kullanmaya devam edebilirsiniz, oturumunuz acik kaldi.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded font-serif tracking-widest"
          >
            TEKRAR DENE
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
