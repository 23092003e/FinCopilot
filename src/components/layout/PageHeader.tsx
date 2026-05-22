/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-900 pb-5 mb-6">
      <div className="space-y-1">
        <h2 className="text-zinc-100 font-extrabold text-xl tracking-tight font-sans">
          {title}
        </h2>
        <p className="text-zinc-400 text-xs font-medium leading-normal">
          {subtitle}
        </p>
      </div>
      {action && (
        <div className="shrink-0 flex items-center">
          {action}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
