package com.pjsofttech.expensetracker.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a SCHEDULED installment for an expense.
 *
 * This is NOT a payment. It is a scheduled due amount.
 * Actual payments are stored in ExpenseInstallmentPayment.
 *
 * paidAmount    = SUM(payments)
 * pendingAmount = dueAmount - paidAmount
 * status        = derived from paidAmount vs dueAmount
 */
@Entity
@Table(name = "expense_installments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseInstallment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @Column(name = "installment_number", nullable = false)
    private Integer installmentNumber;

    /**
     * The scheduled due amount for this installment.
     * Set once when schedule is created. Never modified by payments.
     */
    @Column(name = "due_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal dueAmount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    /**
     * Status is derived dynamically from payments.
     * Stored for fast querying but always recalculated after payment.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private InstallmentStatus status = InstallmentStatus.PENDING;

    /**
     * Payment records for this installment.
     * Supports multiple partial payments.
     */
    @OneToMany(mappedBy = "installment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ExpenseInstallmentPayment> payments = new ArrayList<>();

    // ─────────────────────────────────────────────────────────────────────────
    // DERIVED GETTERS — always computed from payment records
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns total amount paid against this installment.
     */
    public BigDecimal getPaidAmount() {
        return payments.stream()
                .map(ExpenseInstallmentPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Returns the remaining amount due.
     */
    public BigDecimal getPendingAmount() {
        BigDecimal paid = getPaidAmount();
        BigDecimal pending = dueAmount.subtract(paid);
        return pending.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : pending;
    }

    /**
     * Recalculates and stores status based on current payments.
     */
    public void recalculateStatus() {
        BigDecimal paid = getPaidAmount();
        if (paid.compareTo(BigDecimal.ZERO) <= 0) {
            this.status = InstallmentStatus.PENDING;
        } else if (paid.compareTo(dueAmount) >= 0) {
            this.status = InstallmentStatus.PAID;
        } else {
            this.status = InstallmentStatus.PARTIAL;
        }
    }
}
//package com.pjsofttech.expensetracker.model;
//import jakarta.persistence.*;
//import lombok.*;
//
//import java.time.LocalDate;
//
//@Entity
//@Table(name = "expense_payments")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class ExpenseInstallment {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private Long amount;
//
//    private LocalDate date;
//    @Column(nullable = false)
//    private Integer installmentNumber;
//
//    // Planned amount for this installment
//    @Column(nullable = false)
//    private Long dueAmount;
//
//    // Due date
//    @Column(nullable = false)
//    private LocalDate dueDate;
//
//    // Actual amount paid
//    @Builder.Default
//    private Long paidAmount = 0L;
//
//    // Actual payment date
//    private LocalDate paidDate;
//
//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false)
//    @Builder.Default
//    private InstallmentStatus status = InstallmentStatus.PENDING;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "expense_id", nullable = false)
//    private Expense expense;
//}
