package com.pjsofttech.expensetracker.repository;

import com.pjsofttech.expensetracker.model.Expense;
import com.pjsofttech.expensetracker.model.ExpenseInstallment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseInstallmentRepository extends JpaRepository<ExpenseInstallment,Long> {
    List<ExpenseInstallment> findByExpense(Expense expense);
//    List<ExpenseInstallment> findByExpenseOrderByDateAsc(Expense expense);

    @Query("""
        SELECT COALESCE(SUM(i.amount), 0)
        FROM ExpenseInstallment i
        WHERE i.expense = :expense
    """)
    Long getTotalPaidByExpense(@Param("expense") Expense expense);
}
