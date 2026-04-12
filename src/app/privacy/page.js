"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function Privacy() {
  const { t } = useTranslation();

  const sections = [
    "whatWeCollect",
    "whyWeCollect",
    "howWeStore",
    "whoHasAccess",
    "yourRights",
    "dataRetention",
    "contact",
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-indigo/10 dark:bg-pink/10">
                <Shield className="w-8 h-8 text-indigo dark:text-pink" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-indigo dark:text-pink">
              {t("privacy.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("privacy.lastUpdated")}
            </p>
          </div>

          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            <p>{t("privacy.intro")}</p>

            {sections.map((section) => (
              <div key={section}>
                <h2 className="text-xl font-bold mb-3 text-indigo dark:text-pink">
                  {t(`privacy.sections.${section}.title`)}
                </h2>
                <p>{t(`privacy.sections.${section}.content`)}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-indigo dark:text-pink hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("common.back")}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
